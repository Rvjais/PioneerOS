import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'
import { withAuth } from '@/server/auth/withAuth'
import { LATE_THRESHOLD_TIME } from '@/shared/constants/hr'

const AttendanceEntrySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  date: z.string().min(1, 'Date is required').refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'ON_LEAVE', 'WORK_FROM_HOME', 'HOLIDAY']),
  checkIn: z.string().regex(/^\d{2}:\d{2}$/, 'Check-in must be in HH:MM format').optional().nullable(),
  checkOut: z.string().regex(/^\d{2}:\d{2}$/, 'Check-out must be in HH:MM format').optional().nullable(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional().nullable(),
})

// POST: Add or update attendance entry
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

    const body = await req.json()
    const parseResult = AttendanceEntrySchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }
    const { userId, date, status, checkIn, checkOut, notes } = parseResult.data

    // Department-scope MANAGER: can only manage attendance for employees in their own department
    if (dbUser?.role === 'MANAGER' && dbUser.department !== 'HR') {
      const targetEmployee = await prisma.user.findUnique({
        where: { id: userId },
        select: { department: true },
      })
      if (targetEmployee?.department !== dbUser.department) {
        return NextResponse.json({ error: 'Cannot manage employees outside your department' }, { status: 403 })
      }
    }

    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)

    // Check if attendance already exists for this user and date
    const existing = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: attendanceDate,
          lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })

    let attendance
    const checkInTime = checkIn ? new Date(`${date}T${checkIn}:00`) : null
    const checkOutTime = checkOut ? new Date(`${date}T${checkOut}:00`) : null

    // Calculate hours
    let hours = 0
    if (checkInTime && checkOutTime) {
      hours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
    }

    if (hours < 0) {
      return NextResponse.json({ error: 'Check-out time must be after check-in time' }, { status: 400 })
    }

    // Check if late based on configured threshold
    const [lateHour, lateMinute] = LATE_THRESHOLD_TIME.split(':').map(Number)
    let huddleLate = false
    if (checkInTime) {
      const istHour = parseInt(new Intl.DateTimeFormat('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(checkInTime))
      const istMinute = parseInt(new Intl.DateTimeFormat('en-IN', { minute: 'numeric', timeZone: 'Asia/Kolkata' }).format(checkInTime))
      huddleLate = istHour > lateHour || (istHour === lateHour && istMinute > lateMinute)
    }

    if (existing) {
      // Update existing record
      attendance = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          status,
          checkIn: checkInTime,
          checkOut: checkOutTime,
          myZenHours: hours,
          huddleLate,
        },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, department: true },
          },
        },
      })
    } else {
      // Create new record
      attendance = await prisma.attendance.create({
        data: {
          userId,
          date: attendanceDate,
          status,
          checkIn: checkInTime,
          checkOut: checkOutTime,
          myZenHours: hours,
          huddleLate,
          biometricPunch: false,
        },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, department: true },
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      attendance: {
        ...attendance,
        date: attendance.date.toISOString(),
        checkIn: attendance.checkIn?.toISOString() || null,
        checkOut: attendance.checkOut?.toISOString() || null,
      },
    })
  } catch (error) {
    console.error('Failed to save attendance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// DELETE: Remove attendance entry
export const DELETE = withAuth(async (req, { user, params }) => {
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

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing attendance ID' }, { status: 400 })
    }

    // Department-scope MANAGER: can only delete attendance for employees in their own department
    if (dbUser?.role === 'MANAGER' && dbUser.department !== 'HR') {
      const attendance = await prisma.attendance.findUnique({
        where: { id },
        select: { user: { select: { department: true } } },
      })
      if (attendance?.user?.department !== dbUser.department) {
        return NextResponse.json({ error: 'Cannot manage employees outside your department' }, { status: 403 })
      }
    }

    await prisma.attendance.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete attendance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
