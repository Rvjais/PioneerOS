'use client'

import { useState, useMemo } from 'react'

interface Employee {
  id: string
  empId: string
  firstName: string
  lastName: string | null
  department: string
}

interface AttendanceRecord {
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

interface AttendanceImportTableProps {
  records: AttendanceRecord[]
  employees: Employee[]
  onRecordsChange: (records: AttendanceRecord[]) => void
}

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Present', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { value: 'ABSENT', label: 'Absent', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  { value: 'LEAVE', label: 'On Leave', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { value: 'HALF_DAY', label: 'Half Day', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { value: 'WFH', label: 'Work From Home', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
]

export function AttendanceImportTable({ records, employees, onRecordsChange }: AttendanceImportTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [filter, setFilter] = useState<'all' | 'matched' | 'unmatched' | 'low_confidence'>('all')

  // Filter records based on current filter
  const filteredRecords = useMemo(() => {
    switch (filter) {
      case 'matched':
        return records.filter(r => r.matchedUserId)
      case 'unmatched':
        return records.filter(r => !r.matchedUserId)
      case 'low_confidence':
        return records.filter(r => r.matchConfidence > 0 && r.matchConfidence < 0.7)
      default:
        return records
    }
  }, [records, filter])

  const getStatusConfig = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0]
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-emerald-400'
    if (confidence >= 0.7) return 'text-amber-400'
    if (confidence >= 0.4) return 'text-orange-400'
    return 'text-red-400'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.9) return (
      <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
    if (confidence >= 0.7) return (
      <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )
    if (confidence > 0) return (
      <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    )
    return (
      <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    )
  }

  const updateRecord = (index: number, updates: Partial<AttendanceRecord>) => {
    const originalIndex = records.findIndex(r => r === filteredRecords[index])
    if (originalIndex === -1) return

    const newRecords = [...records]
    newRecords[originalIndex] = { ...newRecords[originalIndex], ...updates }
    onRecordsChange(newRecords)
  }

  const handleEmployeeChange = (index: number, userId: string) => {
    const employee = employees.find(e => e.id === userId)
    if (employee) {
      updateRecord(index, {
        matchedUserId: employee.id,
        matchConfidence: 1.0 // Manual selection = full confidence
      })
    }
  }

  const handleStatusChange = (index: number, status: AttendanceRecord['status']) => {
    updateRecord(index, { status })
  }

  const handleTimeChange = (index: number, field: 'checkIn' | 'checkOut', value: string) => {
    updateRecord(index, { [field]: value })
  }

  const toggleSelectAll = () => {
    if (selectedRows.size === filteredRecords.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filteredRecords.map((_, i) => i)))
    }
  }

  const toggleRow = (index: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedRows(newSelected)
  }

  const bulkSetStatus = (status: AttendanceRecord['status']) => {
    const newRecords = [...records]
    selectedRows.forEach(filteredIndex => {
      const originalIndex = records.findIndex(r => r === filteredRecords[filteredIndex])
      if (originalIndex !== -1) {
        newRecords[originalIndex] = { ...newRecords[originalIndex], status }
      }
    })
    onRecordsChange(newRecords)
    setSelectedRows(new Set())
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters and Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Filter:</span>
          <div className="flex gap-1">
            {[
              { value: 'all', label: `All (${records.length})` },
              { value: 'matched', label: `Matched (${records.filter(r => r.matchedUserId).length})` },
              { value: 'unmatched', label: `Unmatched (${records.filter(r => !r.matchedUserId).length})` },
              { value: 'low_confidence', label: `Low Confidence (${records.filter(r => r.matchConfidence > 0 && r.matchConfidence < 0.7).length})` },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as typeof filter)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filter === f.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {selectedRows.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">{selectedRows.size} selected:</span>
            <div className="flex gap-1">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => bulkSetStatus(s.value as AttendanceRecord['status'])}
                  className={`px-2 py-1 rounded text-xs border ${s.color}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === filteredRecords.length && filteredRecords.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-white/20 bg-slate-700 text-purple-500 focus:ring-purple-500"
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase">Match</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase">Employee</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase">Check In</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase">Check Out</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase">Hours</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No records match the current filter
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => {
                  const statusConfig = getStatusConfig(record.status)
                  const matchedEmployee = employees.find(e => e.id === record.matchedUserId)

                  return (
                    <tr
                      key={`${record.employeeName}-${record.date}`}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        !record.matchedUserId ? 'bg-red-500/5' :
                        record.matchConfidence < 0.7 ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(index)}
                          onChange={() => toggleRow(index)}
                          className="rounded border-white/20 bg-slate-700 text-purple-500 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          {getConfidenceIcon(record.matchConfidence)}
                          <span className={`text-xs ${getConfidenceColor(record.matchConfidence)}`}>
                            {record.matchConfidence > 0 ? `${Math.round(record.matchConfidence * 100)}%` : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <select
                            value={record.matchedUserId || ''}
                            onChange={(e) => handleEmployeeChange(index, e.target.value)}
                            className={`px-2 py-1 rounded text-sm bg-slate-800 border ${
                              !record.matchedUserId
                                ? 'border-red-500/50 text-red-300'
                                : record.matchConfidence < 0.7
                                ? 'border-amber-500/50 text-amber-300'
                                : 'border-white/10 text-white'
                            } focus:outline-none focus:ring-1 focus:ring-purple-500`}
                          >
                            <option value="">Select employee...</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id}>
                                {emp.firstName} {emp.lastName || ''} ({emp.empId})
                              </option>
                            ))}
                          </select>
                          <span className="text-xs text-slate-500 truncate max-w-[200px]" title={record.employeeName}>
                            Parsed: {record.employeeName}
                            {record.employeeId && ` (${record.employeeId})`}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-sm text-white">{formatDate(record.date)}</span>
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="time"
                          value={record.checkIn || ''}
                          onChange={(e) => handleTimeChange(index, 'checkIn', e.target.value)}
                          className={`px-2 py-1 rounded text-sm bg-slate-800 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                            record.isLate ? 'text-orange-400' : ''
                          }`}
                        />
                        {record.isLate && (
                          <span className="ml-1 text-xs text-orange-400">Late</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="time"
                          value={record.checkOut || ''}
                          onChange={(e) => handleTimeChange(index, 'checkOut', e.target.value)}
                          className="px-2 py-1 rounded text-sm bg-slate-800 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-sm text-white">
                          {record.totalHours ? `${record.totalHours.toFixed(1)}h` : '-'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={record.status}
                          onChange={(e) => handleStatusChange(index, e.target.value as AttendanceRecord['status'])}
                          className={`px-2 py-1 rounded text-xs font-medium border ${statusConfig.color} bg-transparent focus:outline-none focus:ring-1 focus:ring-purple-500`}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value} className="bg-slate-800">
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
