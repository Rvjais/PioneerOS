import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { syncMyZenAttendance, syncRazorpayStatus } from '@/server/services/myzen'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'

const syncSchema = z.object({
  type: z.enum(['attendance', 'razorpay', 'all']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const POST = withAuth(async (req, { user, params }) => {
  try {
// Check if user is HR or Admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, department: true },
    })

    const isHR = dbUser?.role === 'SUPER_ADMIN' || dbUser?.role === 'MANAGER' || dbUser?.department === 'HR'
    if (!isHR) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const raw = await req.json()
    const parsed = syncSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const { type = 'attendance', startDate, endDate } = parsed.data

    let result: Record<string, unknown> = {}

    if (type === 'attendance' || type === 'all') {
      const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const end = endDate ? new Date(endDate) : new Date()

      const attendanceResult = await syncMyZenAttendance(start, end)
      result.attendance = attendanceResult
    }

    if (type === 'razorpay' || type === 'all') {
      const razorpayResult = await syncRazorpayStatus()
      result.razorpay = razorpayResult
    }

    return NextResponse.json({
      success: true,
      ...result,
      syncedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to sync attendance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

export const GET = withAuth(async (req, { user, params }) => {
  try {
const searchParams = req.nextUrl.searchParams
    const requestedUserId = searchParams.get('userId')
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth()))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    // SECURITY FIX: Users can only view their own attendance
    // HR/Managers can view any user's attendance
    const isAdmin = ['SUPER_ADMIN', 'MANAGER', 'HR'].includes(user.role || '') || user.department === 'HR'
    let userId = user.id

    if (requestedUserId && requestedUserId !== user.id) {
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden - Cannot view other users attendance' }, { status: 403 })
      }
      userId = requestedUserId
    }

    // Get attendance for the month
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59)

    const attendance = await prisma.attendance.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    })

    // Get leaves
    const leaves = await prisma.leaveRequest.findMany({
      where: {
        userId,
        status: 'APPROVED',
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } },
        ],
      },
    })

    // Calculate stats
    let presentDays = 0
    let absentDays = 0
    let lateDays = 0
    let wfhDays = 0
    let totalHours = 0

    attendance.forEach(a => {
      if (a.status === 'PRESENT') presentDays++
      if (a.status === 'WFH') wfhDays++
      if (a.status === 'ABSENT') absentDays++
      if (a.huddleLate) lateDays++
      if (a.myZenHours) totalHours += a.myZenHours
    })

    return NextResponse.json({
      attendance: attendance.map(a => ({
        ...a,
        date: a.date.toISOString(),
        checkIn: a.checkIn?.toISOString() || null,
        checkOut: a.checkOut?.toISOString() || null,
      })),
      leaves: leaves.map(l => ({
        ...l,
        startDate: l.startDate.toISOString(),
        endDate: l.endDate.toISOString(),
      })),
      stats: {
        presentDays,
        absentDays,
        lateDays,
        wfhDays,
        totalHours,
        avgHours: (presentDays + wfhDays) > 0 ? totalHours / (presentDays + wfhDays) : 0,
      },
    })
  } catch (error) {
    console.error('Failed to get attendance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
