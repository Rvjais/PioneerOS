'use client'

import { formatDateDDMMYYYY } from '@/shared/utils/cn'

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

interface AttendanceAnalysisSummaryProps {
  employees: EmployeeStats[]
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
}

const DEDUCTION_RULES = [
  { label: 'Absent without leave', amount: 500, unit: '/day' },
  { label: 'Late arrival (>11:05 AM)', amount: 100, unit: '' },
  { label: 'Early departure (<6 PM)', amount: 100, unit: '' },
]

export function AttendanceAnalysisSummary({ employees, summary, dateRange }: AttendanceAnalysisSummaryProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return formatDateDDMMYYYY(date)
    } catch {
      return dateStr
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
  }

  // Sort employees by total deductions (highest first)
  const sortedEmployees = [...employees].sort((a, b) => b.stats.totalDeductions - a.stats.totalDeductions)

  // Calculate department-wise stats
  const deptStats: Record<string, {
    office: number
    wfh: number
    absent: number
    deductions: number
    employees: number
  }> = {}

  for (const emp of employees) {
    const dept = emp.user.department
    if (!deptStats[dept]) {
      deptStats[dept] = { office: 0, wfh: 0, absent: 0, deductions: 0, employees: 0 }
    }
    deptStats[dept].office += emp.stats.officeDays
    deptStats[dept].wfh += emp.stats.wfhDays
    deptStats[dept].absent += emp.stats.absentDays
    deptStats[dept].deductions += emp.stats.totalDeductions
    deptStats[dept].employees++
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Attendance Analysis</h2>
          <p className="text-slate-400 text-sm mt-1">
            {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-red-400">{formatCurrency(summary.totalDeductions)}</p>
          <p className="text-xs text-slate-400">Total Deductions</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <p className="text-2xl font-bold text-white">{summary.totalRecords}</p>
          <p className="text-xs text-slate-400">Total Records</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-2xl font-bold text-emerald-400">{summary.office}</p>
          <p className="text-xs text-slate-400">Office Days</p>
        </div>
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
          <p className="text-2xl font-bold text-purple-400">{summary.wfh}</p>
          <p className="text-xs text-slate-400">WFH Days</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <p className="text-2xl font-bold text-red-400">{summary.absent}</p>
          <p className="text-xs text-slate-400">Absent Days</p>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-2xl font-bold text-amber-400">{summary.discrepancy}</p>
          <p className="text-xs text-slate-400">Discrepancies</p>
        </div>
      </div>

      {/* Deduction Rules */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Deduction Rules Applied</h3>
        <div className="flex flex-wrap gap-4">
          {DEDUCTION_RULES.map(rule => (
            <div key={rule.label} className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">{rule.label}:</span>
              <span className="text-red-400 font-medium">{formatCurrency(rule.amount)}{rule.unit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Department Summary */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Department Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Department</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Employees</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Office Days</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">WFH Days</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Absent Days</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Deductions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {Object.entries(deptStats).map(([dept, stats]) => (
                <tr key={dept} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-white">{dept}</td>
                  <td className="px-5 py-3 text-sm text-slate-400">{stats.employees}</td>
                  <td className="px-5 py-3 text-sm text-emerald-400">{stats.office}</td>
                  <td className="px-5 py-3 text-sm text-purple-400">{stats.wfh}</td>
                  <td className="px-5 py-3 text-sm text-red-400">{stats.absent}</td>
                  <td className="px-5 py-3 text-sm text-red-400 font-medium">{formatCurrency(stats.deductions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Details */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Employee Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Employee</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Department</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Office Days</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">WFH Days</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Absent</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Late Days</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase">Deductions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No employee data available
                  </td>
                </tr>
              ) : (
                sortedEmployees.map(emp => (
                  <tr key={emp.user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                          {emp.user.firstName[0]}{emp.user.lastName?.[0] || ''}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{emp.user.firstName} {emp.user.lastName || ''}</p>
                          <p className="text-xs text-slate-500">{emp.user.empId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-400">{emp.user.department}</td>
                    <td className="px-5 py-3 text-sm text-emerald-400">{emp.stats.officeDays}</td>
                    <td className="px-5 py-3 text-sm text-purple-400">{emp.stats.wfhDays}</td>
                    <td className="px-5 py-3 text-sm text-red-400">{emp.stats.absentDays}</td>
                    <td className="px-5 py-3">
                      {emp.stats.lateDays > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-xs">
                          {emp.stats.lateDays} days
                        </span>
                      ) : (
                        <span className="text-sm text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {emp.stats.totalDeductions > 0 ? (
                        <span className="text-sm font-medium text-red-400">{formatCurrency(emp.stats.totalDeductions)}</span>
                      ) : (
                        <span className="text-sm text-emerald-400">{formatCurrency(0)}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
