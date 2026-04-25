/**
 * API Route: Client-Access Calendar
 * GET /api/client-access/calendar?year=2026&month=4
 * Returns client-access-specific calendar data: meetings, calls, reviews, deliveries
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

    const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(user.role)
    const department = user.department

    // Fetch client-access related data
    const [meetings, events, tasks, deliverables] = await Promise.all([
      // Client meetings
      prisma.meeting.findMany({
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          OR: [
            { participants: { some: { userId: user.id } } },
            ...(isManager ? [{ participants: { some: { user: { department } } } }] : []),
          ],
        },
        include: {
          client: { select: { id: true, name: true } },
          participants: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
            take: 20,
          },
        },
        orderBy: { date: 'asc' },
        take: 100,
      }),

      // Events (reviews, deliveries)
      prisma.event.findMany({
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          type: { in: ['MEETING', 'REVIEW', 'DELIVERY', 'CALL'] },
        },
        orderBy: { date: 'asc' },
        take: 50,
      }),

      // Tasks with client deliverables
      prisma.task.findMany({
        where: {
          dueDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          OR: [
            { assigneeId: user.id },
            { creatorId: user.id },
            ...(isManager ? [{ assignee: { department } }] : []),
            { type: 'DELIVERABLE' },
          ],
          clientId: { not: null },
        },
        include: {
          client: { select: { id: true, name: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 50,
      }),

      // Client deliverables
      prisma.clientDeliverable.findMany({
        where: {
          dueDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: {
          client: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 50,
      }),
    ])

    // Transform data into client-access calendar events
    const eventsList = [
      ...meetings.filter(m => m.client).map(meeting => ({
        id: meeting.id,
        title: meeting.title,
        type: 'MEETING' as const,
        date: serializeDate(meeting.date),
        startTime: meeting.date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        client: meeting.client,
        participants: meeting.participants?.map(p => p.user),
      })),

      ...events.map(event => ({
        id: event.id,
        title: event.title,
        type: event.type as 'MEETING' | 'CALL' | 'REVIEW' | 'DELIVERY',
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
        type: 'DELIVERY' as const,
        date: serializeDate(task.dueDate),
        priority: task.priority,
        status: task.status,
        assignee: task.assignee,
        client: task.client,
      })),

      ...deliverables.map(del => ({
        id: del.id,
        title: del.title,
        type: 'DELIVERY' as const,
        date: serializeDate(del.dueDate),
        status: del.status,
        client: del.client,
        assignedTo: del.assignedTo,
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
        meetings: eventsList.filter(e => e.type === 'MEETING').length,
        calls: eventsList.filter(e => e.type === 'CALL').length,
        reviews: eventsList.filter(e => e.type === 'REVIEW').length,
        deliveries: eventsList.filter(e => e.type === 'DELIVERY').length,
      }
    })
  } catch (error) {
    console.error('Failed to fetch client-access calendar data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client-access calendar data' },
      { status: 500 }
    )
  }
})

// POST /api/client-access/calendar — Create client-access event
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
    const validTypes = ['MEETING', 'CALL', 'REVIEW', 'DELIVERY']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be MEETING, CALL, REVIEW, or DELIVERY' },
        { status: 400 }
      )
    }

    let result

    if (type === 'MEETING' || type === 'CALL') {
      const allParticipantIds = new Set(participantIds || [])
      allParticipantIds.add(user.id)

      result = await prisma.meeting.create({
        data: {
          title,
          description: description || null,
          date: eventDate,
          type: 'CLIENT_CALL',
          clientId: clientId || null,
          status: 'SCHEDULED',
          isOnline: type === 'CALL',
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
    } else if (type === 'DELIVERY') {
      result = await prisma.task.create({
        data: {
          title,
          description: description || null,
          department: 'CLIENT_ACCESS',
          priority: 'HIGH',
          status: 'TODO',
          type: 'DELIVERABLE',
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
    console.error('Failed to create client-access calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create client-access calendar event' },
      { status: 500 }
    )
  }
})