'use client'

import { useState, useEffect } from 'react'
import { Clock, Users, Home, Calendar, AlertTriangle } from 'lucide-react'

interface AttendanceRecord {
  id: string
  name: string
  department: string
  status: string
  checkIn?: string
  checkOut?: string
  totalHours: number
}

export default function ManagerHRAttendancePage() {
  const [view, setView] = useState<'today' | 'monthly'>('today')
  const [todayData, setTodayData] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ present: 0, wfh: 0, leave: 0, absent: 0, total: 0 })

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      // Fetch today's attendance from real API
      const today = new Date().toISOString().slice(0, 10)
      const [attendanceRes, usersRes] = await Promise.all([
        fetch(`/api/hr/attendance?date=${today}`),
        fetch('/api/hr/employees'),
      ])

      let attendanceRecords: AttendanceRecord[] = []
      let totalEmployees = 0

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        const employees = usersData.employees || []
        totalEmployees = employees.length

        if (attendanceRes.ok) {
          const attData = await attendanceRes.json()
          const attendanceMap = new Map<string, { status: string; checkIn: string | null; checkOut: string | null; totalHours: number }>()

          const records = Array.isArray(attData) ? attData : attData.data || attData.attendance || []
          for (const a of records) {
            attendanceMap.set(a.userId, {
              status: a.status || 'PRESENT',
              checkIn: a.checkIn ? new Date(a.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null,
              checkOut: a.checkOut ? new Date(a.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null,
              totalHours: a.totalHours || a.myZenHours || 0,
            })
          }

          attendanceRecords = employees.map((emp: { id: string; firstName: string; lastName?: string; department: string }) => {
            const att = attendanceMap.get(emp.id)
            return {
              id: emp.id,
              name: `${emp.firstName} ${emp.lastName || ''}`.trim(),
              department: emp.department,
              status: att?.status || 'ABSENT',
              checkIn: att?.checkIn || '-',
              checkOut: att?.checkOut || '-',
              totalHours: att?.totalHours || 0,
            }
          })
        } else {
          // No attendance data — show all as absent
          attendanceRecords = employees.map((emp: { id: string; firstName: string; lastName?: string; department: string }) => ({
            id: emp.id,
            name: `${emp.firstName} ${emp.lastName || ''}`.trim(),
            department: emp.department,
            status: 'ABSENT',
            checkIn: '-',
            checkOut: '-',
            totalHours: 0,
          }))
        }
      }

      setTodayData(attendanceRecords)

      const present = attendanceRecords.filter(a => a.status === 'PRESENT').length
      const wfh = attendanceRecords.filter(a => a.status === 'WFH').length
      const leave = attendanceRecords.filter(a => a.status === 'LEAVE' || a.status === 'ON_LEAVE').length
      const absent = totalEmployees - present - wfh - leave
      setStats({ present, wfh, leave, absent: Math.max(0, absent), total: totalEmployees })
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date()
  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dateStr = `${dd}-${mm}-${today.getFullYear()}`

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-emerald-500/20 text-emerald-400'
      case 'WFH': return 'bg-blue-500/20 text-blue-400'
      case 'LEAVE': case 'ON_LEAVE': return 'bg-amber-500/20 text-amber-400'
      case 'HALF_DAY': return 'bg-purple-500/20 text-purple-400'
      case 'ABSENT': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-800/50 text-slate-400'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance</h1>
          <p className="text-slate-400">{dateStr}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'today' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Today
          </button>
          <button
            onClick={() => setView('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'monthly' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">{stats.present}</p>
              <p className="text-xs text-slate-400">Present</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{stats.wfh}</p>
              <p className="text-xs text-slate-400">WFH</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{stats.leave}</p>
              <p className="text-xs text-slate-400">On Leave</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{stats.absent}</p>
              <p className="text-xs text-slate-400">Absent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-5 py-3">Employee</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-5 py-3">Department</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-5 py-3">Status</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-5 py-3">Check In</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-5 py-3">Check Out</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-5 py-3">Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {todayData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  No attendance records for today
                </td>
              </tr>
            ) : (
              todayData.map(record => (
                <tr key={record.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <p className="font-medium text-white">{record.name}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-slate-400">{record.department}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-300">{record.checkIn}</td>
                  <td className="px-5 py-3 text-sm text-slate-300">{record.checkOut}</td>
                  <td className="px-5 py-3 text-sm text-slate-300">{record.totalHours > 0 ? `${record.totalHours.toFixed(1)}h` : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
