import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const dateStr = searchParams.get('date')
    
    // Default to today if no date provided
    const targetDate = dateStr ? new Date(dateStr) : new Date()
    targetDate.setHours(0, 0, 0, 0)
    
    const nextDay = new Date(targetDate)
    nextDay.setDate(targetDate.getDate() + 1)

    // Role-based scoping
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, department: true }
    })

    const isHR = dbUser?.role === 'SUPER_ADMIN' || dbUser?.role === 'MANAGER' || dbUser?.department === 'HR'
    
    if (!isHR && dbUser?.role !== 'EMPLOYEE') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const whereClause: any = {
      date: {
        gte: targetDate,
        lt: nextDay
      }
    }

    // If regular manager, only see own department
    if (dbUser?.role === 'MANAGER' && dbUser?.department !== 'HR') {
      whereClause.user = { department: dbUser.department }
    } else if (dbUser?.role === 'EMPLOYEE') {
      // Regular employees can only see their own attendance
      whereClause.userId = user.id
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, department: true }
        }
      }
    })

    // Map to expected format
    const formatted = attendance.map(a => ({
      id: a.id,
      userId: a.userId,
      status: a.status,
      checkIn: a.checkIn,
      checkOut: a.checkOut,
      totalHours: a.myZenHours,
      huddleLate: a.huddleLate
    }))

    return NextResponse.json({ attendance: formatted })
  } catch (error) {
    console.error('Failed to fetch attendance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
