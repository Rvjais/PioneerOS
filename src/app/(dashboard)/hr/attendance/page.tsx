'use client'

import { useState, useEffect, useMemo } from 'react'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import Link from 'next/link'
import { downloadCSV } from '@/client/utils/downloadCSV'
import PageGuide from '@/client/components/ui/PageGuide'
import { LATE_THRESHOLD_TIME } from '@/shared/constants/hr'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface User {
  id: string
  firstName: string
  lastName: string | null
  department: string
}

interface AttendanceRecord {
  id: string
  userId: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: string
  myZenHours: number
  huddleLate: boolean
  user: User
}

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Present', color: 'bg-emerald-500/20 text-emerald-300' },
  { value: 'ABSENT', label: 'Absent', color: 'bg-red-500/20 text-red-300' },
  { value: 'LEAVE', label: 'On Leave', color: 'bg-amber-500/20 text-amber-300' },
  { value: 'HALF_DAY', label: 'Half Day', color: 'bg-blue-500/20 text-blue-300' },
  { value: 'WFH', label: 'Work From Home', color: 'bg-purple-500/20 text-purple-300' },
]

export default function AttendancePage() {
  const [users, setUsers] = useState<User[]>([])
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    checkIn: '09:30',
    checkOut: '18:30',
  })

  const now = new Date()
  const lateThreshold = LATE_THRESHOLD_TIME

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, attendanceRes] = await Promise.all([
        fetch('/api/hr/employees'),
        fetch('/api/hr/attendance/sync'),
      ])

      const usersData = await usersRes.json()
      const attendanceData = await attendanceRes.json()

      setUsers(usersData.employees || [])
      setTodayAttendance(attendanceData.attendance || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/hr/attendance/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowAddForm(false)
        setFormData({
          userId: '',
          date: new Date().toISOString().split('T')[0],
          status: 'PRESENT',
          checkIn: '09:30',
          checkOut: '18:30',
        })
        fetchData()
      }
    } catch (error) {
      console.error('Failed to save attendance:', error)
    } finally {
      setSaving(false)
    }
  }

  const getStatusConfig = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0]
  }

  // Stats - properly categorize: present (PRESENT/WFH), on leave (LEAVE/HALF_DAY), absent (no record)
  const present = todayAttendance.filter(a => a.status === 'PRESENT' || a.status === 'WFH')
  const onLeave = todayAttendance.filter(a => a.status === 'LEAVE' || a.status === 'HALF_DAY')
  // Absent = total users minus those with any attendance record today (including LEAVE/HALF_DAY)
  // Users on approved leave are in todayAttendance with LEAVE/HALF_DAY status - don't count them as absent
  const absent = users.length - todayAttendance.filter(a => a.status !== 'ABSENT').length
  const late = todayAttendance.filter(a => a.huddleLate)

  // Group by department
  const deptStats: Record<string, { total: number; present: number }> = {}
  for (const user of users) {
    if (!deptStats[user.department]) deptStats[user.department] = { total: 0, present: 0 }
    deptStats[user.department].total++
    if (todayAttendance.find(a => a.userId === user.id && (a.status === 'PRESENT' || a.status === 'WFH'))) {
      deptStats[user.department].present++
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <PageGuide
        pageKey="attendance"
        title="Attendance Tracker"
        description="Track daily employee attendance, late arrivals, and work-from-home status."
        steps={[
          { label: 'View today\'s attendance', description: 'See who is present, absent, or on leave' },
          { label: 'Add entries', description: 'Manually record attendance for team members' },
          { label: 'Export records', description: 'Download attendance data as CSV' },
        ]}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance Tracker</h1>
          <p className="text-slate-400 mt-1">
            {formatDateDDMMYYYY(now)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadCSV(todayAttendance.map(r => ({
              'Employee Name': `${r.user.firstName} ${r.user.lastName || ''}`.trim(),
              'Emp ID': r.userId,
              Date: r.date ? formatDateDDMMYYYY(r.date) : '',
              'Check In': r.checkIn ? new Date(r.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
              'Check Out': r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
              Status: r.status,
              Hours: r.myZenHours ? r.myZenHours.toFixed(1) : '',
            })), 'attendance.csv')}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 hover:bg-white/10 transition"
          >
            Export CSV
          </button>
          <Link
            href="/hr/attendance/calendar"
            className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-colors"
          >
            Calendar View
          </Link>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Entry
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <p className="text-3xl font-bold text-white">{users.length}</p>
          <p className="text-sm text-slate-400">Total Team</p>
        </div>
        <div className="bg-emerald-500/5 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4">
          <p className="text-3xl font-bold text-emerald-400">{present.length}</p>
          <p className="text-sm text-slate-400">Present</p>
        </div>
        <div className="bg-amber-500/5 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4">
          <p className="text-3xl font-bold text-amber-400">{onLeave.length}</p>
          <p className="text-sm text-slate-400">On Leave</p>
        </div>
        <div className="bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-2xl p-4">
          <p className="text-3xl font-bold text-red-400">{Math.max(0, absent)}</p>
          <p className="text-sm text-slate-400">Absent</p>
        </div>
        <div className="bg-orange-500/5 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-4">
          <p className="text-3xl font-bold text-orange-400">{late.length}</p>
          <p className="text-sm text-slate-400">Late (&gt;{lateThreshold})</p>
        </div>
        <div className="bg-blue-500/5 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-4">
          <p className="text-3xl font-bold text-blue-400">
            {users.length > 0 ? Math.round(((present.length + onLeave.length) / users.length) * 100) : 0}%
          </p>
          <p className="text-sm text-slate-400">Attendance Rate</p>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Department Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(deptStats).map(([dept, stats]) => (
            <div key={dept} className="bg-white/5 backdrop-blur-sm rounded-xl p-3">
              <p className="text-sm font-medium text-white mb-2">{dept}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{stats.present}/{stats.total} present</span>
                <span className="text-sm font-bold text-white">
                  {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-white/10 backdrop-blur-sm rounded-full h-1.5 mt-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-green-400 h-1.5 rounded-full"
                  style={{ width: `${stats.total > 0 ? (stats.present / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Attendance Grid */}
      <div className="bg-white/5 backdrop-blur-sm backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Today&apos;s Attendance</h2>
          <span className="text-sm text-slate-400">{todayAttendance.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 backdrop-blur-sm">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Employee</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Department</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Check In</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Check Out</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Hours</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {todayAttendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No attendance records for today. Click "Add Entry" to add.
                  </td>
                </tr>
              ) : (
                todayAttendance.map((record) => {
                  const config = getStatusConfig(record.status)
                  const checkIn = record.checkIn ? new Date(record.checkIn) : null
                  const checkOut = record.checkOut ? new Date(record.checkOut) : null
                  const hours = record.myZenHours ? record.myZenHours.toFixed(1) : '-'
                  const isLate = record.huddleLate

                  return (
                    <tr key={record.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={{ id: record.user.id, firstName: record.user.firstName, lastName: record.user.lastName }} size="sm" showPreview={false} />
                          <span className="text-sm font-medium text-white">{record.user.firstName} {record.user.lastName || ''}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-400">{record.user.department}</td>
                      <td className="px-5 py-3">
                        <span className={`text-sm ${isLate ? 'text-orange-400 font-medium' : 'text-white'}`}>
                          {checkIn ? checkIn.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          {isLate && (
                            <svg className="w-3.5 h-3.5 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-white">
                        {checkOut ? checkOut.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-white">{hours}h</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Attendance Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-white">Add Attendance Entry</h2>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Employee</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select employee...</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Check In</label>
                  <input
                    type="time"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Check Out</label>
                  <input
                    type="time"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
