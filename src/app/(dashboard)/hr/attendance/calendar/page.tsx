import { prisma } from '@/server/db/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import { AttendanceCalendar } from './AttendanceCalendar'
import { SyncMyZenButton } from './SyncMyZenButton'

async function getAttendanceCalendarData(month: number, year: number) {
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59)

  const [attendance, users, leaveRequests] = await Promise.all([
    // Get all attendance for the month
    prisma.attendance.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            empId: true,
            department: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    }),
    // Get all active users with their profile (biometric/razorpay status)
    prisma.user.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        empId: true,
        department: true,
        profile: {
          select: {
            biometricPunch: true,
            razorpayLinked: true,
          },
        },
      },
      orderBy: { firstName: 'asc' },
    }),
    // Get approved leave requests for the month
    prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          {
            startDate: { lte: monthEnd },
            endDate: { gte: monthStart },
          },
        ],
      },
      select: {
        id: true,
        userId: true,
        type: true,
        startDate: true,
        endDate: true,
      },
    }),
  ])

  return { attendance, users, leaveRequests }
}

interface Props {
  searchParams: Promise<{ month?: string; year?: string }>
}

export default async function AttendanceCalendarPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const params = await searchParams
  const now = new Date()
  const month = params.month ? parseInt(params.month) : now.getMonth()
  const year = params.year ? parseInt(params.year) : now.getFullYear()

  const { attendance, users, leaveRequests } = await getAttendanceCalendarData(month, year)

  // Calculate stats
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const workingDays = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1)
    const day = date.getDay()
    return day !== 0 && day !== 6 // Exclude weekends
  }).filter(Boolean).length

  // Group attendance by user
  const userAttendance: Record<string, Record<string, typeof attendance[number]>> = {}
  attendance.forEach(a => {
    if (!userAttendance[a.userId]) userAttendance[a.userId] = {}
    const dateKey = new Date(a.date).toISOString().split('T')[0]
    userAttendance[a.userId][dateKey] = a
  })

  // Map leave requests by user and date
  const userLeaves: Record<string, Record<string, typeof leaveRequests[number]>> = {}
  leaveRequests.forEach(leave => {
    if (!userLeaves[leave.userId]) userLeaves[leave.userId] = {}
    const start = new Date(leave.startDate)
    const end = new Date(leave.endDate)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]
      userLeaves[leave.userId][dateKey] = leave
    }
  })

  // Calculate per-user stats
  const userStats = users.map(user => {
    const userAtt = userAttendance[user.id] || {}
    const userLv = userLeaves[user.id] || {}

    let presentDays = 0
    let absentDays = 0
    let lateDays = 0
    let wfhDays = 0
    let leaveDays = 0
    let avgHours = 0
    let totalHours = 0

    Object.values(userAtt).forEach((a) => {
      if (a.status === 'PRESENT') presentDays++
      if (a.status === 'WFH') wfhDays++
      if (a.status === 'ABSENT') absentDays++
      if (a.status === 'HALF_DAY') presentDays += 0.5
      if (a.huddleLate) lateDays++
      if (a.myZenHours) totalHours += a.myZenHours
    })

    leaveDays = Object.keys(userLv).length

    const totalPresent = presentDays + wfhDays
    avgHours = totalPresent > 0 ? totalHours / totalPresent : 0

    return {
      ...user,
      presentDays,
      absentDays,
      lateDays,
      wfhDays,
      leaveDays,
      avgHours,
      attendanceRate: workingDays > 0 ? Math.round(((totalPresent + leaveDays) / workingDays) * 100) : 0,
    }
  })

  // Overall stats
  const biometricUsers = users.filter(u => u.profile?.biometricPunch).length
  const razorpayUsers = users.filter(u => u.profile?.razorpayLinked).length

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">MyZen Attendance Calendar</h1>
          <p className="text-slate-300 mt-1">Biometric attendance tracking and Razorpay integration</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/hr/attendance"
            className="px-4 py-2 bg-slate-800/50 text-slate-200 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
          >
            Daily View
          </a>
          <SyncMyZenButton month={month} year={year} />
        </div>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-sm text-slate-400">Total Employees</p>
            </div>
          </div>
        </div>
        <div className="glass-card border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{biometricUsers}</p>
              <p className="text-sm text-slate-400">Biometric Enabled</p>
            </div>
          </div>
        </div>
        <div className="glass-card border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">{razorpayUsers}</p>
              <p className="text-sm text-slate-400">Razorpay Linked</p>
            </div>
          </div>
        </div>
        <div className="glass-card border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{workingDays}</p>
              <p className="text-sm text-slate-400">Working Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <AttendanceCalendar
        month={month}
        year={year}
        users={userStats.map(u => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName || '',
          empId: u.empId,
          department: u.department,
          biometricPunch: u.profile?.biometricPunch || false,
          razorpayLinked: u.profile?.razorpayLinked || false,
          presentDays: u.presentDays,
          absentDays: u.absentDays,
          lateDays: u.lateDays,
          wfhDays: u.wfhDays,
          leaveDays: u.leaveDays,
          avgHours: u.avgHours,
          attendanceRate: u.attendanceRate,
        }))}
        attendance={attendance.map(a => ({
          id: a.id,
          userId: a.userId,
          date: a.date.toISOString(),
          status: a.status,
          checkIn: a.checkIn?.toISOString() || null,
          checkOut: a.checkOut?.toISOString() || null,
          myZenHours: a.myZenHours,
          biometricPunch: a.biometricPunch,
          huddleLate: a.huddleLate,
        }))}
        leaves={leaveRequests.map(l => ({
          id: l.id,
          userId: l.userId,
          type: l.type,
          startDate: l.startDate.toISOString(),
          endDate: l.endDate.toISOString(),
        }))}
      />
    </div>
  )
}
