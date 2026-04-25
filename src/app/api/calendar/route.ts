/**
 * API Route: Calendar Data
 * GET /api/calendar?year=2026&month=3
 *
 * Returns meetings, events, tasks, leaves, tactical deadlines, and HR announcements
 * for a specific month
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { cache, cacheTTL } from '@/server/cache/redis'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

function serializeDate(date: Date | null): string | null {
  return date ? date.toISOString() : null
}

export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)

    const isManager = ['SUPER_ADMIN', 'MANAGER', 'OPERATIONS_HEAD'].includes(user.role)
    const department = user.department

    // Cache key based on user, role, and month
    const cacheKey = `calendar:${user.id}:${year}-${month}:${isManager ? 'mgr' : 'emp'}`

    // Try to get from cache first (1 minute cache for calendar data)
    const cachedData = await cache.get(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    // Fetch all data in parallel
    const [meetings, events, tasks, leaves, hrAnnouncements] = await Promise.all([
      // Meetings (limited to 100 per month)
      prisma.meeting.findMany({
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
          // Show meetings where user is a participant
          OR: [
            { participants: { some: { userId: user.id } } },
            // Managers see all department meetings
            ...(isManager ? [{ participants: { some: { user: { department } } } }] : []),
          ],
        },
        include: {
          client: { select: { id: true, name: true } },
          participants: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
            take: 10, // Limit participants shown per meeting
          },
        },
        orderBy: { date: 'asc' },
        take: 100,
      }),

      // Events (limited to 50 per month)
      prisma.event.findMany({
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        orderBy: { date: 'asc' },
        take: 50,
      }),

      // Tasks with deadlines (limited to 100 per month)
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
          ],
        },
        include: {
          client: { select: { id: true, name: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 100,
      }),

      // Approved leaves (limited to 50 per month)
      prisma.leaveRequest.findMany({
        where: {
          status: 'APPROVED',
          OR: [
            // Leaves that overlap with this month
            {
              startDate: { lte: endOfMonth },
              endDate: { gte: startOfMonth },
            },
          ],
          // Filter by department for managers, only own for others
          ...(isManager
            ? { user: { department } }
            : { userId: user.id }),
        },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { startDate: 'asc' },
        take: 50,
      }),

      // HR Announcements - from MASH channel or posts with ANNOUNCEMENT type
      prisma.post.findMany({
        where: {
          type: 'ANNOUNCEMENT',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          type: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ])

    // Serialize and format data
    const serializedMeetings = meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      date: serializeDate(meeting.date),
      type: meeting.type,
      client: meeting.client,
      participants: meeting.participants?.map(p => ({
        user: {
          firstName: p.user.firstName,
          lastName: p.user.lastName,
        },
      })),
    }))

    const serializedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      date: serializeDate(event.date),
      type: event.type,
      isAllDay: event.isAllDay,
    }))

    const serializedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      dueDate: serializeDate(task.dueDate),
      priority: task.priority,
      client: task.client,
      assignee: task.assignee,
    }))

    const serializedLeaves = leaves.map(leave => ({
      id: leave.id,
      type: leave.type,
      startDate: serializeDate(leave.startDate),
      endDate: serializeDate(leave.endDate),
      status: leave.status,
      user: {
        id: leave.user.id,
        firstName: leave.user.firstName,
        lastName: leave.user.lastName,
      },
    }))

    const serializedHRAnnouncements = hrAnnouncements.map(announcement => ({
      id: announcement.id,
      title: announcement.content.substring(0, 100) + (announcement.content.length > 100 ? '...' : ''),
      date: serializeDate(announcement.createdAt),
      type: announcement.type,
    }))

    // Tactical deadline info (always 3rd of month)
    const tacticalDeadlines = [{
      month: `${year}-${String(month).padStart(2, '0')}`,
      dueDate: new Date(year, month - 1, 3).toISOString(),
      pendingCount: 0, // Could fetch actual count if needed
    }]

    const responseData = {
      meetings: serializedMeetings,
      events: serializedEvents,
      tasks: serializedTasks,
      leaves: serializedLeaves,
      tacticalDeadlines,
      hrAnnouncements: serializedHRAnnouncements,
    }

    // Cache for 1 minute
    await cache.set(cacheKey, responseData, cacheTTL.SHORT)

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Failed to fetch calendar data:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch calendar data' },
      { status: 500 }
    )
  }
})

// ============================================
// POST /api/calendar — Create a calendar event
// ============================================

const createCalendarItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  date: z.string().datetime({ message: 'Valid ISO date required' }),
  endDate: z.string().datetime().optional(),
  type: z.enum(['MEETING', 'DEADLINE', 'REMINDER', 'EVENT', 'TASK']),
  isAllDay: z.boolean().default(true),
  participantIds: z.array(z.string()).optional(),
  clientId: z.string().optional(),
})

export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json()
    const parsed = createCalendarItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { title, description, date, endDate, type, isAllDay, participantIds, clientId } = parsed.data
    const eventDate = new Date(date)
    const eventEndDate = endDate ? new Date(endDate) : undefined

    let result: Record<string, unknown>

    if (type === 'MEETING' || (participantIds && participantIds.length > 0)) {
      // Create a Meeting with MeetingParticipant entries
      const allParticipantIds = new Set(participantIds || [])
      allParticipantIds.add(user.id) // Always include creator

      const meeting = await prisma.meeting.create({
        data: {
          title,
          description: description || null,
          date: eventDate,
          type: type === 'MEETING' ? 'INTERNAL' : type,
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

      // Send notifications to participants (excluding creator)
      const otherParticipants = Array.from(allParticipantIds).filter(id => id !== user.id)
      if (otherParticipants.length > 0) {
        await prisma.notification.createMany({
          data: otherParticipants.map(participantId => ({
            userId: participantId,
            type: 'MEETING',
            title: 'New Meeting Scheduled',
            message: `${user.firstName} invited you to "${title}" on ${eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
            link: '/calendar',
            priority: 'NORMAL',
          })),
        })
      }

      result = { ...meeting, itemType: 'meeting' }
    } else if (type === 'TASK') {
      // Create a Task record with the date as deadline
      const task = await prisma.task.create({
        data: {
          title,
          description: description || null,
          department: user.department,
          priority: 'MEDIUM',
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

      result = { ...task, itemType: 'task' }
    } else {
      // DEADLINE, REMINDER, EVENT — create an Event record
      const event = await prisma.event.create({
        data: {
          title,
          description: description || null,
          date: eventDate,
          endDate: eventEndDate || null,
          type,
          isAllDay,
        },
      })

      // If participants were somehow specified for an event, notify them
      if (participantIds && participantIds.length > 0) {
        await prisma.notification.createMany({
          data: participantIds.filter(id => id !== user.id).map(participantId => ({
            userId: participantId,
            type: 'GENERAL',
            title: `New ${type}: ${title}`,
            message: `${user.firstName} created "${title}" on ${eventDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
            link: '/calendar',
            priority: 'NORMAL',
          })),
        })
      }

      result = { ...event, itemType: 'event' }
    }

    // Invalidate calendar cache for the relevant month
    const cachePattern = `calendar:*:${eventDate.getFullYear()}-${eventDate.getMonth() + 1}:*`
    await cache.delPattern(cachePattern).catch(() => {
      // Cache invalidation is best-effort
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Failed to create calendar item:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create calendar item' },
      { status: 500 }
    )
  }
})

// ============================================
// DELETE /api/calendar?id=xxx&type=event|meeting|task
// ============================================

export const DELETE = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const itemType = searchParams.get('type') // 'event' | 'meeting' | 'task'

    if (!id || !itemType) {
      return NextResponse.json(
        { error: 'Both "id" and "type" query parameters are required' },
        { status: 400 }
      )
    }

    const isAdmin = ['SUPER_ADMIN', 'MANAGER'].includes(user.role)

    if (itemType === 'meeting') {
      const meeting = await prisma.meeting.findUnique({
        where: { id },
        include: { participants: { where: { role: 'ORGANIZER' } } },
      })

      if (!meeting) {
        return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
      }

      const isOrganizer = meeting.participants.some(p => p.userId === user.id)
      if (!isOrganizer && !isAdmin) {
        return NextResponse.json({ error: 'Only the organizer or an admin can delete this meeting' }, { status: 403 })
      }

      await prisma.meeting.delete({ where: { id } })
    } else if (itemType === 'task') {
      const task = await prisma.task.findUnique({ where: { id } })

      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 })
      }

      if (task.creatorId !== user.id && task.assigneeId !== user.id && !isAdmin) {
        return NextResponse.json({ error: 'Only the creator, assignee, or an admin can delete this task' }, { status: 403 })
      }

      await prisma.task.delete({ where: { id } })
    } else if (itemType === 'event') {
      const event = await prisma.event.findUnique({ where: { id } })

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }

      // Events don't have a creator field, so only admins can delete
      if (!isAdmin) {
        return NextResponse.json({ error: 'Only an admin can delete events' }, { status: 403 })
      }

      await prisma.event.delete({ where: { id } })
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "event", "meeting", or "task"' },
        { status: 400 }
      )
    }

    // Best-effort cache invalidation
    await cache.delPattern('calendar:*').catch(() => {})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete calendar item:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete calendar item' },
      { status: 500 }
    )
  }
})
