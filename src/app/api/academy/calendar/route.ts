/**
 * API Route: Academy Calendar
 * GET /api/academy/calendar?year=2026&month=4
 * Returns academy-specific calendar data: courses, webinars, assignments, exams, sessions
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

function serializeDate(date: Date | null): string | null {
  return date ? date.toISOString() : null
}

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)

    // Fetch academy-related data
    const [meetings, events, tasks] = await Promise.all([
      // Meetings related to training/learning
      prisma.meeting.findMany({
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          OR: [
            { participants: { some: { userId: user.id } } },
            { title: { contains: 'training', mode: 'insensitive' } },
            { title: { contains: 'session', mode: 'insensitive' } },
            { title: { contains: 'webinar', mode: 'insensitive' } },
          ],
        },
        include: {
          client: { select: { id: true, name: true } },
          participants: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
            take: 10,
          },
        },
        orderBy: { date: 'asc' },
        take: 50,
      }),

      // Events (courses, webinars, exams, sessions)
      prisma.event.findMany({
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          type: { in: ['COURSE', 'WEBINAR', 'EXAM', 'SESSION'] },
        },
        orderBy: { date: 'asc' },
        take: 50,
      }),

      // Tasks/Assignments with due dates
      prisma.task.findMany({
        where: {
          dueDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          OR: [
            { assigneeId: user.id },
            { creatorId: user.id },
            { type: 'ASSIGNMENT' },
          ],
        },
        include: {
          client: { select: { id: true, name: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 50,
      }),
    ])

    // Transform data into academy calendar events
    const eventsList = [
      ...meetings.map(meeting => ({
        id: meeting.id,
        title: meeting.title,
        type: 'SESSION' as const,
        date: serializeDate(meeting.date),
        startTime: meeting.date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        client: meeting.client,
      })),

      ...events.map(event => ({
        id: event.id,
        title: event.title,
        type: event.type as 'COURSE' | 'WEBINAR' | 'EXAM' | 'SESSION',
        date: serializeDate(event.date),
        startTime: event.date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        description: event.description,
        isAllDay: event.isAllDay,
      })),

      ...tasks.map(task => ({
        id: task.id,
        title: task.title,
        type: 'ASSIGNMENT' as const,
        date: serializeDate(task.dueDate),
        priority: task.priority,
        status: task.status,
        assignee: task.assignee,
        client: task.client,
      })),
    ]

    // Group by date
    const eventsByDate: Record<string, typeof eventsList> = {}
    eventsList.forEach(event => {
      if (event.date) {
        const dateKey = event.date.split('T')[0]
        if (!eventsByDate[dateKey]) {
          eventsByDate[dateKey] = []
        }
        eventsByDate[dateKey].push(event)
      }
    })

    return NextResponse.json({
      events: eventsList,
      eventsByDate,
      stats: {
        totalEvents: eventsList.length,
        courses: eventsList.filter(e => e.type === 'COURSE').length,
        webinars: eventsList.filter(e => e.type === 'WEBINAR').length,
        assignments: eventsList.filter(e => e.type === 'ASSIGNMENT').length,
        exams: eventsList.filter(e => e.type === 'EXAM').length,
        sessions: eventsList.filter(e => e.type === 'SESSION').length,
      }
    })
  } catch (error) {
    console.error('Failed to fetch academy calendar data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch academy calendar data' },
      { status: 500 }
    )
  }
})

// POST /api/academy/calendar — Create academy event
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const { title, description, date, endDate, type, isAllDay, participantIds, clientId } = body

    if (!title || !date || !type) {
      return NextResponse.json(
        { error: 'Title, date, and type are required' },
        { status: 400 }
      )
    }

    const eventDate = new Date(date)
    const validTypes = ['COURSE', 'WEBINAR', 'ASSIGNMENT', 'EXAM', 'SESSION', 'MEETING']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be COURSE, WEBINAR, ASSIGNMENT, EXAM, SESSION, or MEETING' },
        { status: 400 }
      )
    }

    let result

    if (type === 'SESSION' || type === 'MEETING') {
      // Create meeting for sessions
      const allParticipantIds = new Set(participantIds || [])
      allParticipantIds.add(user.id)

      result = await prisma.meeting.create({
        data: {
          title,
          description: description || null,
          date: eventDate,
          type: 'TRAINING',
          clientId: clientId || null,
          status: 'SCHEDULED',
          isOnline: true,
          participants: {
            create: Array.from(allParticipantIds).map((userId, idx) => ({
              userId,
              role: idx === 0 && userId === user.id ? 'ORGANIZER' : 'ATTENDEE',
            })),
          },
        },
        include: {
          participants: {
            include: { user: { select: { id: true, firstName: true, lastName: true } } },
          },
          client: { select: { id: true, name: true } },
        },
      })
    } else if (type === 'ASSIGNMENT') {
      // Create task for assignments
      result = await prisma.task.create({
        data: {
          title,
          description: description || null,
          department: 'LEARNING',
          priority: 'MEDIUM',
          status: 'TODO',
          type: 'ASSIGNMENT',
          dueDate: eventDate,
          creatorId: user.id,
          assigneeId: user.id,
          clientId: clientId || null,
        },
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true } },
          client: { select: { id: true, name: true } },
        },
      })
    } else {
      // Create event for courses, webinars, exams
      result = await prisma.event.create({
        data: {
          title,
          description: description || null,
          date: eventDate,
          endDate: endDate ? new Date(endDate) : null,
          type,
          isAllDay: isAllDay ?? false,
        },
      })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Failed to create academy calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create academy calendar event' },
      { status: 500 }
    )
  }
})