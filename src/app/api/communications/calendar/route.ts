/**
 * API Route: Communications Calendar
 * GET /api/communications/calendar?year=2026&month=4
 * Returns communications-specific calendar data: campaigns, emails, social, meetings, deadlines
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

    // Fetch communications-related data
    const [meetings, events, tasks] = await Promise.all([
      // Meetings related to communications/marketing
      prisma.meeting.findMany({
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          OR: [
            { participants: { some: { userId: user.id } } },
            { title: { contains: 'campaign', mode: 'insensitive' } },
            { title: { contains: 'email', mode: 'insensitive' } },
            { title: { contains: 'social', mode: 'insensitive' } },
            { title: { contains: 'marketing', mode: 'insensitive' } },
            { title: { contains: 'comm', mode: 'insensitive' } },
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

      // Events (campaigns, emails, social posts, deadlines)
      prisma.event.findMany({
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          type: { in: ['CAMPAIGN', 'EMAIL', 'SOCIAL', 'MEETING', 'DEADLINE'] },
        },
        orderBy: { date: 'asc' },
        take: 50,
      }),

      // Tasks with communications-related keywords
      prisma.task.findMany({
        where: {
          dueDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          OR: [
            { assigneeId: user.id },
            { creatorId: user.id },
            {
              OR: [
                { title: { contains: 'campaign', mode: 'insensitive' } },
                { title: { contains: 'email', mode: 'insensitive' } },
                { title: { contains: 'social media', mode: 'insensitive' } },
                { title: { contains: 'newsletter', mode: 'insensitive' } },
                { title: { contains: 'communication', mode: 'insensitive' } },
              ],
            },
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

    // Transform data into communications calendar events
    const eventsList = [
      ...meetings.map(meeting => ({
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
        type: event.type as 'CAMPAIGN' | 'EMAIL' | 'SOCIAL' | 'MEETING' | 'DEADLINE',
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
        type: 'DEADLINE' as const,
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
        campaigns: eventsList.filter(e => e.type === 'CAMPAIGN').length,
        emails: eventsList.filter(e => e.type === 'EMAIL').length,
        social: eventsList.filter(e => e.type === 'SOCIAL').length,
        meetings: eventsList.filter(e => e.type === 'MEETING').length,
        deadlines: eventsList.filter(e => e.type === 'DEADLINE').length,
      }
    })
  } catch (error) {
    console.error('Failed to fetch communications calendar data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch communications calendar data' },
      { status: 500 }
    )
  }
})

// POST /api/communications/calendar — Create communications event
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
    const validTypes = ['CAMPAIGN', 'EMAIL', 'SOCIAL', 'MEETING', 'DEADLINE']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be CAMPAIGN, EMAIL, SOCIAL, MEETING, or DEADLINE' },
        { status: 400 }
      )
    }

    let result

    if (type === 'MEETING') {
      const allParticipantIds = new Set(participantIds || [])
      allParticipantIds.add(user.id)

      result = await prisma.meeting.create({
        data: {
          title,
          description: description || null,
          date: eventDate,
          type: 'INTERNAL',
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
    } else if (type === 'DEADLINE') {
      result = await prisma.task.create({
        data: {
          title,
          description: description || null,
          department: 'COMMUNICATIONS',
          priority: 'HIGH',
          status: 'TODO',
          type: 'TASK',
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
    console.error('Failed to create communications calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create communications calendar event' },
      { status: 500 }
    )
  }
})