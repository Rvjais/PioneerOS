import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const month = parseInt(searchParams.get('month') || new Date().getMonth().toString())
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59)

    // Fetch interviews
    const interviews = await prisma.interview.findMany({
      where: {
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        candidate: {
          select: {
            name: true,
            position: true,
          },
        },
      },
    })

    // Fetch approved leave requests
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } },
        ],
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Fetch recent hires for onboarding (users who joined in the month)
    const newHires = await prisma.user.findMany({
      where: {
        joiningDate: {
          gte: startDate,
          lte: endDate,
        },
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        joiningDate: true,
        department: true,
      },
    })

    // Transform data into calendar events
    const events = [
      // Interview events
      ...interviews.map(interview => ({
        id: interview.id,
        title: `Interview - ${interview.candidate?.name || 'Candidate'}`,
        type: 'INTERVIEW' as const,
        date: interview.scheduledAt.toISOString().split('T')[0],
        time: interview.scheduledAt.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        personName: interview.candidate?.name,
        personId: interview.candidateId,
      })),

      // Leave events
      ...leaveRequests.map(leave => ({
        id: leave.id,
        title: `Leave - ${leave.user.firstName} ${leave.user.lastName || ''}`,
        type: 'LEAVE' as const,
        date: leave.startDate.toISOString().split('T')[0],
        personName: `${leave.user.firstName} ${leave.user.lastName || ''}`,
        personId: leave.userId,
      })),

      // Onboarding events
      ...newHires.map(hire => ({
        id: hire.id,
        title: `Onboarding - ${hire.firstName} ${hire.lastName || ''}`,
        type: 'ONBOARDING' as const,
        date: hire.joiningDate.toISOString().split('T')[0],
        time: '10:00 AM',
        personName: `${hire.firstName} ${hire.lastName || ''}`,
        personId: hire.id,
      })),
    ]

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Failed to fetch HR calendar events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
