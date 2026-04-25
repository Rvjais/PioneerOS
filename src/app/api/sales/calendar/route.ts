import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const month = parseInt(searchParams.get('month') || new Date().getMonth().toString())
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59)

    // Fetch meetings for the month
    const meetings = await prisma.meeting.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    })

    // Fetch tasks with due dates in the month (for FOLLOWUP, PROPOSAL, CLOSING types)
    const tasks = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
        department: 'SALES',
      },
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true },
        },
        client: {
          select: { id: true, name: true },
        },
      },
    })

    // Map meeting types to sales event types
    const getSalesEventType = (meeting: { category?: string | null; type?: string | null }): string => {
      if (meeting.category === 'CLIENT_MEETING' || meeting.type === 'CLIENT_CALL') return 'CALL'
      if (meeting.category === 'STANDUP') return 'MEETING'
      return 'MEETING'
    }

    // Transform data into calendar events
    const events = [
      // Meeting events
      ...meetings.map(meeting => ({
        id: meeting.id,
        title: meeting.title,
        type: getSalesEventType(meeting) as 'CALL' | 'MEETING' | 'DEMO' | 'PROPOSAL' | 'CLOSING' | 'FOLLOWUP',
        date: meeting.date.toISOString().split('T')[0],
        time: meeting.date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
        personName: meeting.client?.name,
        personId: meeting.clientId,
      })),

      // Task events - map task types to sales event types
      ...tasks.map(task => {
        let eventType: 'CALL' | 'MEETING' | 'DEMO' | 'PROPOSAL' | 'CLOSING' | 'FOLLOWUP' = 'FOLLOWUP'
        if (task.type) {
          const upperType = task.type.toUpperCase()
          if (['CALL', 'MEETING', 'DEMO', 'PROPOSAL', 'CLOSING', 'FOLLOWUP'].includes(upperType)) {
            eventType = upperType as 'CALL' | 'MEETING' | 'DEMO' | 'PROPOSAL' | 'CLOSING' | 'FOLLOWUP'
          }
        }
        return {
          id: task.id,
          title: task.title,
          type: eventType,
          date: task.dueDate!.toISOString().split('T')[0],
          time: task.dueDate!.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          personName: task.client?.name || (task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName || ''}` : undefined),
          personId: task.assigneeId,
        }
      }),
    ]

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Failed to fetch sales calendar events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
