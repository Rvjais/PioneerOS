'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface User {
  id: string
  firstName: string
  lastName: string
  empId: string
  department: string
  biometricPunch: boolean
  razorpayLinked: boolean
  presentDays: number
  absentDays: number
  lateDays: number
  wfhDays: number
  leaveDays: number
  avgHours: number
  attendanceRate: number
}

interface AttendanceRecord {
  id: string
  userId: string
  date: string
  status: string
  checkIn: string | null
  checkOut: string | null
  myZenHours: number
  biometricPunch: boolean
  huddleLate: boolean
}

interface Leave {
  id: string
  userId: string
  type: string
  startDate: string
  endDate: string
}

interface Props {
  month: number
  year: number
  users: User[]
  attendance: AttendanceRecord[]
  leaves: Leave[]
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const STATUS_COLORS: Record<string, string> = {
  PRESENT: 'bg-green-500',
  ABSENT: 'bg-red-500',
  HALF_DAY: 'bg-amber-500',
  WFH: 'bg-blue-500',
  LEAVE: 'bg-purple-500',
  LATE: 'bg-orange-500',
}

export function AttendanceCalendar({ month, year, users, attendance, leaves }: Props) {
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar')
  const [filterDept, setFilterDept] = useState<string>('ALL')

  // Get unique departments
  const departments = ['ALL', ...new Set(users.map(u => u.department))]

  // Generate calendar days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1
    if (day < 1 || day > daysInMonth) return null
    return day
  })

  // Create attendance lookup
  const attendanceLookup: Record<string, Record<string, AttendanceRecord>> = {}
  attendance.forEach(a => {
    const dateKey = a.date.split('T')[0]
    if (!attendanceLookup[a.userId]) attendanceLookup[a.userId] = {}
    attendanceLookup[a.userId][dateKey] = a
  })

  // Create leaves lookup
  const leavesLookup: Record<string, Record<string, Leave>> = {}
  leaves.forEach(leave => {
    if (!leavesLookup[leave.userId]) leavesLookup[leave.userId] = {}
    const start = new Date(leave.startDate)
    const end = new Date(leave.endDate)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]
      leavesLookup[leave.userId][dateKey] = leave
    }
  })

  const filteredUsers = users.filter(u => filterDept === 'ALL' || u.department === filterDept)

  const navigateMonth = (delta: number) => {
    let newMonth = month + delta
    let newYear = year
    if (newMonth < 0) {
      newMonth = 11
      newYear--
    } else if (newMonth > 11) {
      newMonth = 0
      newYear++
    }
    router.push(`/hr/attendance/calendar?month=${newMonth}&year=${newYear}`)
  }

  const getCellStatus = (userId: string, day: number) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const att = attendanceLookup[userId]?.[dateKey]
    const leave = leavesLookup[userId]?.[dateKey]

    if (leave) return { status: 'LEAVE', type: leave.type }
    if (att) {
      if (att.huddleLate) return { ...att, status: 'LATE' }
      return { ...att }
    }

    // Check if it's a weekend
    const date = new Date(year, month, day)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) return { status: 'WEEKEND' }

    // Check if date is in past
    const today = new Date()
    if (date < today) return { status: 'ABSENT' }

    return { status: 'FUTURE' }
  }

  const selectedUserData = selectedUser ? users.find(u => u.id === selectedUser) : null

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="glass-card border border-white/10 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-slate-800/50 rounded-lg"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-white min-w-[180px] text-center">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-slate-800/50 rounded-lg"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-3 py-2 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept === 'ALL' ? 'All Departments' : dept}</option>
              ))}
            </select>

            <div className="flex bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 text-sm font-medium rounded ${viewMode === 'calendar' ? 'glass-card shadow' : ''}`}
              >
                Calendar
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-sm font-medium rounded ${viewMode === 'table' ? 'glass-card shadow' : ''}`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${color}`} />
            <span className="text-slate-300">{status}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/20" />
          <span className="text-slate-300">WEEKEND</span>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* User List */}
          <div className="glass-card border border-white/10 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-slate-900/40">
              <h3 className="font-semibold text-white">Employees ({filteredUsers.length})</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user.id === selectedUser ? null : user.id)}
                  className={`w-full p-3 border-b border-white/5 text-left hover:bg-slate-900/40 transition-colors ${
                    selectedUser === user.id ? 'bg-blue-500/10 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={{ id: user.id, firstName: user.firstName, lastName: user.lastName, empId: user.empId }} size="sm" showPreview={false} />
                      <div>
                        <p className="font-medium text-white text-sm">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-slate-400">{user.empId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {user.biometricPunch && (
                        <span className="w-2 h-2 bg-green-500 rounded-full" title="Biometric enabled" />
                      )}
                      {user.razorpayLinked && (
                        <span className="w-2 h-2 bg-purple-500 rounded-full" title="Razorpay linked" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <span className={`px-1.5 py-0.5 rounded ${user.attendanceRate >= 90 ? 'bg-green-500/20 text-green-400' : user.attendanceRate >= 75 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                      {user.attendanceRate}%
                    </span>
                    <span>{user.department}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="lg:col-span-3 glass-card border border-white/10 rounded-xl overflow-hidden">
            {selectedUser ? (
              <div>
                <div className="p-4 border-b border-white/10 bg-slate-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedUserData && <UserAvatar user={{ id: selectedUserData.id, firstName: selectedUserData.firstName, lastName: selectedUserData.lastName, empId: selectedUserData.empId, department: selectedUserData.department }} size="md" showPreview={false} />}
                    <div>
                      <h3 className="font-semibold text-white">
                        {selectedUserData?.firstName} {selectedUserData?.lastName}
                      </h3>
                      <p className="text-sm text-slate-400">{selectedUserData?.empId} - {selectedUserData?.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-green-400 font-bold">{selectedUserData?.presentDays}</p>
                      <p className="text-xs text-slate-400">Present</p>
                    </div>
                    <div className="text-center">
                      <p className="text-blue-400 font-bold">{selectedUserData?.wfhDays}</p>
                      <p className="text-xs text-slate-400">WFH</p>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-400 font-bold">{selectedUserData?.leaveDays}</p>
                      <p className="text-xs text-slate-400">Leave</p>
                    </div>
                    <div className="text-center">
                      <p className="text-orange-600 font-bold">{selectedUserData?.lateDays}</p>
                      <p className="text-xs text-slate-400">Late</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-300 font-bold">{selectedUserData?.avgHours.toFixed(1)}h</p>
                      <p className="text-xs text-slate-400">Avg Hours</p>
                    </div>
                  </div>
                </div>

                {/* Calendar */}
                <div className="p-4">
                  <div className="grid grid-cols-7 gap-1">
                    {DAYS.map(day => (
                      <div key={day} className="p-2 text-center text-xs font-medium text-slate-400">
                        {day}
                      </div>
                    ))}
                    {calendarDays.map((day, idx) => {
                      if (day === null) {
                        return <div key={`empty-${idx}`} className="p-2" />
                      }

                      const cellStatus = getCellStatus(selectedUser, day)
                      const bgColor = cellStatus.status === 'WEEKEND' ? 'bg-slate-800/50' :
                        cellStatus.status === 'FUTURE' ? 'glass-card' :
                        STATUS_COLORS[cellStatus.status] || 'bg-white/10'

                      return (
                        <div
                          key={`day-${day}`}
                          className={`p-2 rounded-lg text-center cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all ${bgColor} ${bgColor.includes('500') ? 'text-white' : 'text-slate-200'}`}
                          title={`${day} ${MONTHS[month]} - ${cellStatus.status}`}
                        >
                          <p className="font-medium">{day}</p>
                          {'myZenHours' in cellStatus && (cellStatus.myZenHours as number) > 0 && (
                            <p className="text-xs opacity-80">{cellStatus.myZenHours as number}h</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Select an employee to view their attendance calendar</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="glass-card border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900/40 border-b border-white/10">
                  <th className="text-left px-4 py-3 font-medium text-slate-300 sticky left-0 bg-slate-900/40">Employee</th>
                  <th className="text-center px-2 py-3 font-medium text-slate-300">Status</th>
                  <th className="text-center px-2 py-3 font-medium text-slate-300">Present</th>
                  <th className="text-center px-2 py-3 font-medium text-slate-300">WFH</th>
                  <th className="text-center px-2 py-3 font-medium text-slate-300">Leave</th>
                  <th className="text-center px-2 py-3 font-medium text-slate-300">Late</th>
                  <th className="text-center px-2 py-3 font-medium text-slate-300">Avg Hours</th>
                  <th className="text-center px-2 py-3 font-medium text-slate-300">Rate</th>
                  <th className="text-center px-2 py-3 font-medium text-slate-300">Bio</th>
                  <th className="text-center px-2 py-3 font-medium text-slate-300">Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 sticky left-0 glass-card">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={{ id: user.id, firstName: user.firstName, lastName: user.lastName, empId: user.empId }} size="sm" showPreview={false} />
                        <div>
                          <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-slate-400">{user.empId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <span className="px-2 py-1 text-xs font-medium bg-slate-800/50 text-slate-200 rounded">
                        {user.department}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-center font-medium text-green-400">{user.presentDays}</td>
                    <td className="px-2 py-3 text-center font-medium text-blue-400">{user.wfhDays}</td>
                    <td className="px-2 py-3 text-center font-medium text-purple-400">{user.leaveDays}</td>
                    <td className="px-2 py-3 text-center font-medium text-orange-600">{user.lateDays}</td>
                    <td className="px-2 py-3 text-center font-medium text-slate-300">{user.avgHours.toFixed(1)}h</td>
                    <td className="px-2 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        user.attendanceRate >= 90 ? 'bg-green-500/20 text-green-400' :
                        user.attendanceRate >= 75 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {user.attendanceRate}%
                      </span>
                    </td>
                    <td className="px-2 py-3 text-center">
                      {user.biometricPunch ? (
                        <span className="text-green-400">Yes</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-center">
                      {user.razorpayLinked ? (
                        <span className="text-purple-400">Yes</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
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
